require "thor"
require "json"
require_relative "lib/database"
require_relative "lib/config"
require "terminal-table"

module FreeLocationSheet
  class CLI < Thor
    class_option :remote, type: :string, desc: "Override rclone remote path for this invocation"

    default_command :belongings

    desc "setup", "Configure the rclone remote path to the spreadsheet"
    def setup
      existing = Config.remote_path
      prompt = existing ? "Remote path [#{existing}]:" : "Remote path:"
      path = ask(prompt).to_s.strip
      if path.empty?
        if existing
          say "Kept existing remote path: #{existing}", :cyan
        else
          say "No remote path configured. Run `fls setup` first.", :red
        end
        return
      end
      unless path.match?(%r{\A[^:]+:.+})
        say "Warning: Remote path should follow the format 'remote:path' (e.g. 'drive:/sheet.xlsx')", :yellow
      end
      Config.remote_path = path
      say "Remote path saved: #{path}", :green
    end

    desc "belongings [KEYWORD]", "Search and list belongings (optional keyword filter)"
    option :id, type: :string, desc: "Show a specific belonging by ID"
    option :with_storage, type: :boolean, default: false, desc: "Include storage info"
    def belongings(keyword = nil)
      db = load_database

      if options[:id]
        b = db.find_belonging_by_id(options[:id])
        unless b
          say "Belonging not found: #{options[:id]}", :red
          return
        end
        display_belonging_detail(db, b)
        return
      end

      results = if keyword && !keyword.strip.empty?
        db.search_belongings(keyword)
      else
        db.belongings
      end

      if results.empty?
        say "No belongings found", :yellow
        return
      end

      if options[:with_storage]
        results = results.map { |b| db.belonging_with_storage(b) }
      end

      display_belongings_table(results, with_storage: options[:with_storage])
    end

    desc "storages [KEYWORD]", "Search and list storages (optional keyword filter)"
    option :id, type: :string, desc: "Show a specific storage by ID"
    option :with_belongings, type: :boolean, default: false, desc: "Include belongings in this storage"
    def storages(keyword = nil)
      db = load_database

      if options[:id]
        s = db.find_storage_by_id(options[:id])
        unless s
          say "Storage not found: #{options[:id]}", :red
          return
        end
        display_storage_detail(db, s, with_belongings: options[:with_belongings])
        return
      end

      results = if keyword && !keyword.strip.empty?
        db.search_storages(keyword)
      else
        db.storages
      end

      if results.empty?
        say "No storages found", :yellow
        return
      end

      display_storages_table(results)
    end

    def self.exit_on_failure?
      true
    end

    private

    def resolve_remote_path
      options[:remote] || Config.remote_path
    end

    def load_database
      remote_path = resolve_remote_path
      unless remote_path
          raise Thor::Error, "Error: No remote path configured. Run `fls setup` first."
      end
      db = Database.new(remote_path: remote_path)
      db.fetch
      if db.from_cache?
        say "Loaded spreadsheet from cache", :cyan
      else
        say "Fetched spreadsheet from #{remote_path}", :cyan
      end
      db
    rescue StandardError => e
      say "Error: #{e.message}", :red
      exit 1
    end

    def display_belongings_table(belongings, with_storage: false)
      headers = %w[ID Name Description Qty StorageID Printed Deadline]
      headers.insert(5, "Storage") if with_storage

      rows = belongings.map do |b|
        row = [truncate(b[:id], 8), b[:name] || "(empty)", truncate(b[:description], 30),
               b[:quantities], b[:storage_id] ? truncate(b[:storage_id], 8) : "-",
               b[:printed], b[:deadline] || "-"]
        if with_storage
          storage = b[:storage]
          row.insert(5, storage ? (storage[:name] || "-") : "(not found)")
        end
        row
      end

      table = ::Terminal::Table.new(headings: headers, rows: rows)
      say table.to_s
      say "\n#{belongings.size} belonging(s) found", :cyan
    end

    def display_belonging_detail(db, b)
      b = db.belonging_with_storage(b)
      storage = b[:storage]

      table = ::Terminal::Table.new(title: b[:name] || "Belonging") do |t|
        t.add_row ["ID", b[:id]]
        t.add_row ["Name", b[:name] || "-"]
        t.add_row ["Description", b[:description] || "-"]
        t.add_row ["Quantities", b[:quantities] || "-"]
        t.add_row ["Storage ID", b[:storage_id] || "-"]
        t.add_row ["Storage Name", storage ? (storage[:name] || "-") : "(not found)"]
        t.add_row ["Storage Description", storage ? (storage[:description] || "-") : "(not found)"]
        t.add_row ["Printed", b[:printed].nil? ? "-" : b[:printed].to_s]
        t.add_row ["Deadline", b[:deadline] || "-"]
      end
      say table.to_s
    end

    def display_storages_table(storages)
      headers = %w[ID Name Description Printed]

      rows = storages.map do |s|
        [truncate(s[:id], 8), s[:name] || "(empty)", truncate(s[:description], 30),
         s[:printed]]
      end

      table = ::Terminal::Table.new(headings: headers, rows: rows)
      say table.to_s
      say "\n#{storages.size} storage(s) found", :cyan
    end

    def display_storage_detail(db, s, with_belongings: false)
      table = ::Terminal::Table.new(title: s[:name] || "Storage") do |t|
        t.add_row ["ID", s[:id]]
        t.add_row ["Name", s[:name] || "-"]
        t.add_row ["Description", s[:description] || "-"]
        t.add_row ["Printed", s[:printed].nil? ? "-" : s[:printed].to_s]
      end
      say table.to_s

      if with_belongings
        items = db.belongings.select { |b| b[:storage_id] == s[:id] }
        if items.empty?
          say "\nNo belongings in this storage", :yellow
        else
          say "\nBelongings in this storage:", :cyan
          display_belongings_table(items)
        end
      end
    end

    def truncate(str, max_len)
      return "-" if str.nil? || str.empty?
      str.length > max_len ? "#{str[0...max_len]}..." : str
    end
  end
end

FreeLocationSheet::CLI.send(:remove_command, :tree)
FreeLocationSheet::CLI.start(ARGV)
