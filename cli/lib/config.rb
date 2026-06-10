require "fileutils"
require "json"

module FreeLocationSheet
  module Config
    CONFIG_DIR = File.join(Dir.home, ".config", "free-location-sheet")
    CONFIG_FILE = File.join(CONFIG_DIR, "config.json")

    def self.load
      ensure_dir
      return {} unless File.exist?(CONFIG_FILE)
      JSON.parse(File.read(CONFIG_FILE))
    rescue JSON::ParserError
      {}
    end

    def self.save(config)
      ensure_dir
      File.write(CONFIG_FILE, JSON.pretty_generate(config))
    end

    def self.remote_path
      load["remote_path"]
    end

    def self.remote_path=(path)
      config = load
      config["remote_path"] = path
      save(config)
    end

    private

    def self.ensure_dir
      FileUtils.mkdir_p(CONFIG_DIR)
    end
  end
end
