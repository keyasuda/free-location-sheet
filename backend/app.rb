# RWS_APPLICATION_ID: 楽天ウェブサービス アプリケーションID
# ALLOW_ORIGIN: CORS用

require "functions_framework"
require 'rakuten_web_service'

headers = {'Access-Control-Allow-Origin' => ENV['ALLOW_ORIGIN']}

FunctionsFramework.http "ichiba_proxy" do |request|
  ean = request.params["ean"]

  # 市場へ問い合わせ
  items = RakutenWebService::Ichiba::Item.search(keyword: ean)
  item = items.first

  if item
    payload = {
      name: item['itemName'],
      url: item['itemUrl']
    }

    Rack::Response.new(payload.to_json, 200, headers)
  else
    Rack::Response.new('not found',  404, headers)
  end
end
