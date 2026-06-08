#!/bin/env ruby

require 'json'

open('src/settings.js', 'w') do |f|
  f.puts "export const apiKey = #{ENV['API_KEY'].to_json}"
  f.puts "export const clientId = #{ENV['CLIENT_ID'].to_json}"
  f.puts "export const rakutenApplicationId = #{ENV['RAKUTEN_APPLICATION_ID'].to_json}"
  f.puts "export const rakutenAccessKey = #{ENV['RAKUTEN_ACCESS_KEY'].to_json}"
end
