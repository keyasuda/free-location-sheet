# free-location-sheet

"free-location-sheet" is an implementation of [wms.suzuran.dev](https://wms.suzuran.dev/), which introduces "free location inventory management" for indivisual belongings at home with Google Spreadsheets.

[![Node.js CI](https://github.com/keyasuda/free-location-sheet/actions/workflows/node.js.yml/badge.svg)](https://github.com/keyasuda/free-location-sheet/actions/workflows/node.js.yml)

## Installation

For Firebase hosting use the following command:

```
npm run deploy
```

For other hosting infrastructure, build with following command and publish files under build/.

```
npm run build-prod
```

### Auto complete feature backend

For Cloud Function use the following command inside backend/:

```
gcloud functions deploy ichiba_proxy --project=PROJECT_ID --runtime ruby27 --memory=128MB --trigger-http --allow-unauthenticated --region=asia-northeast1 --set-env-vars RWS_APPLICATION_ID=APPLICATION_ID,ALLOW_ORIGIN=ORIGIN
```

## Usage

See [wms.suzuran.dev](https://wms.suzuran.dev/).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
