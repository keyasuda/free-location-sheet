require "roo"
require "tmpdir"
require "fileutils"
require "open3"
require "digest"

module FreeLocationSheet
  class FetchError < StandardError; end

class Database
  CACHE_DIR = File.join(Dir.home, ".cache", "free-location-sheet")
  CACHE_TTL = 5 * 60

  attr_reader :spreadsheet_path

  def from_cache?
    @from_cache
  end

  def initialize(remote_path:)
    @remote_path = remote_path
    @spreadsheet_path = nil
    @workbook = nil
    @storages_cache = nil
    @belongings_cache = nil
  end

  def fetch
    @spreadsheet_path, @from_cache = cached_download
    @workbook = Roo::Excelx.new(@spreadsheet_path)
    @storages_cache = nil
    @belongings_cache = nil
    self
  end

    def belongings
      @belongings_cache ||= parse_belongings
    end

    def storages
      @storages_cache ||= parse_storages
    end

    def find_storage_by_id(storage_id)
      storages.find { |s| s[:id] == storage_id }
    end

    def search_storages(keyword)
      return storages if keyword.nil? || keyword.strip.empty?

      patterns = keyword.strip.split(/\s+/).map { |w| /#{Regexp.escape(w)}/i }
      storages.select do |s|
        patterns.all? do |pattern|
          (s[:name]&.match?(pattern) || s[:description]&.match?(pattern))
        end
      end
    end

    def search_belongings(keyword)
      return belongings if keyword.nil? || keyword.strip.empty?

      patterns = keyword.strip.split(/\s+/).map { |w| /#{Regexp.escape(w)}/i }
      belongings.select do |b|
        patterns.all? do |pattern|
          (b[:name]&.match?(pattern) || b[:description]&.match?(pattern))
        end
      end
    end

    def find_belonging_by_id(id)
      belongings.find { |b| b[:id] == id }
    end

    def belonging_with_storage(belonging)
      result = belonging.dup
      result[:storage] = belonging[:storage_id] ? find_storage_by_id(belonging[:storage_id]) : nil
      result
    end

    private

    def cached_download
      cache_key = Digest::SHA256.hexdigest(@remote_path)
      cache_path = File.join(CACHE_DIR, "#{cache_key}.xlsx")
      meta_path = File.join(CACHE_DIR, "#{cache_key}.meta")

      FileUtils.mkdir_p(CACHE_DIR)

      if File.exist?(cache_path) && File.exist?(meta_path)
        mtime = File.mtime(meta_path)
        if Time.now - mtime < CACHE_TTL
          return [cache_path, true]
        end
      end

      tmp_dir = Dir.mktmpdir("free-location-sheet-")
      begin
        cmd = ["rclone", "copy", @remote_path, tmp_dir]
        stdout, stderr, status = Open3.capture3(*cmd)
        unless status.success?
          raise FetchError, "rclone copy failed: #{stderr}"
        end

        tmp_file = Dir.glob(File.join(tmp_dir, "*.xlsx")).first
        unless tmp_file
          raise FetchError, "No .xlsx file found after rclone copy"
        end

        FileUtils.cp(tmp_file, cache_path)
        FileUtils.touch(meta_path)
      ensure
        FileUtils.rm_rf(tmp_dir)
      end

      [cache_path, false]
    end

    BELONGINGS_HEADER = %w[row id name description quantities storageId printed deadline].freeze
    STORAGES_HEADER = %w[row id name description printed].freeze

    def parse_belongings
      return [] unless @workbook.sheets.include?("belongings")

      sheet = @workbook.sheet("belongings")
      return [] if sheet.last_row.nil? || sheet.last_row < 2

      header_row = sheet.row(1).map { |v| v&.to_s&.strip }
      col_map = build_column_map(header_row, BELONGINGS_HEADER)

      rows = []
      (2..sheet.last_row).each do |row_num|
        values = sheet.row(row_num)
        next if values.nil? || values.all?(&:nil?)

        b = {
          row: col_val(values, col_map, "row") { |v| safe_to_i(v) },
          id: col_val(values, col_map, "id") { |v| safe_to_s(v) },
          name: col_val(values, col_map, "name") { |v| safe_to_s(v) },
          description: col_val(values, col_map, "description") { |v| safe_to_s(v) },
          quantities: col_val(values, col_map, "quantities") { |v| safe_to_i(v) },
          storage_id: col_val(values, col_map, "storageId") { |v| safe_to_s(v) },
          printed: col_val(values, col_map, "printed") { |v| to_boolean(v) },
          deadline: col_val(values, col_map, "deadline") { |v| format_date(v) }
        }
        next if b[:id].nil? || b[:id].empty?
        rows << b
      end
      rows
    end

    def parse_storages
      return [] unless @workbook.sheets.include?("storages")

      sheet = @workbook.sheet("storages")
      return [] if sheet.last_row.nil? || sheet.last_row < 2

      header_row = sheet.row(1).map { |v| v&.to_s&.strip }
      col_map = build_column_map(header_row, STORAGES_HEADER)

      rows = []
      (2..sheet.last_row).each do |row_num|
        values = sheet.row(row_num)
        next if values.nil? || values.all?(&:nil?)

        s = {
          row: col_val(values, col_map, "row") { |v| safe_to_i(v) },
          id: col_val(values, col_map, "id") { |v| safe_to_s(v) },
          name: col_val(values, col_map, "name") { |v| safe_to_s(v) },
          description: col_val(values, col_map, "description") { |v| safe_to_s(v) },
          printed: col_val(values, col_map, "printed") { |v| to_boolean(v) }
        }
        next if s[:id].nil? || s[:id].empty?
        rows << s
      end
      rows
    end

    def build_column_map(header_row, expected_headers)
      map = {}
      expected_headers.each_with_index do |name, idx|
        if idx < header_row.length && header_row[idx] == name
          map[name] = idx
        end
      end
      header_row.each_with_index do |h, idx|
        map[h] = idx if h && expected_headers.include?(h)
      end
      map
    end

    def col_val(values, col_map, column_name)
      idx = col_map[column_name]
      return nil if idx.nil? || idx >= values.length
      value = values[idx]
      block_given? ? yield(value) : value
    end

    def to_boolean(value)
      return true if value == true || value == "TRUE" || value == "true"
      return false if value == false || value == "FALSE" || value == "false"
      nil
    end

    def safe_to_i(value)
      case value
      when Integer, Float then value.to_i
      when String then value.to_i if value.match?(/\A-?\d+/)
      else nil
      end
    end

    def safe_to_s(value)
      case value
      when String then value
      when TrueClass, FalseClass then value.to_s
      when Integer, Float then value.to_s
      else nil
      end
    end

    def format_date(value)
      case value
      when Date, Time, DateTime
        value.strftime("%Y/%m/%d")
      when String
        value
      else
        nil
      end
    end
  end
end
