#!/bin/env ruby

require 'json'

open('src/settings.js', 'w') do |f|
  f.puts "export const apiKey = #{ENV['API_KEY'].to_json}"
  f.puts "export const clientId = #{ENV['CLIENT_ID'].to_json}"
  f.puts "export const autoFillEndpoint = #{ENV['AUTO_FILL_ENDPOINT'].to_json}"
end
