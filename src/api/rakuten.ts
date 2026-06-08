import { rakutenApplicationId, rakutenAccessKey } from '../settings'

const RAKUTEN_ENDPOINT =
  'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401'

export async function searchItemByEan(
  ean: string
): Promise<{ name: string; url: string } | null> {
  const params = new URLSearchParams({
    applicationId: rakutenApplicationId,
    accessKey: rakutenAccessKey,
    keyword: ean,
    formatVersion: '2',
    hits: '1',
  })

  const response = await fetch(`${RAKUTEN_ENDPOINT}?${params}`)

  if (!response.ok) return null

  const data = await response.json()

  if (data.Items && data.Items.length > 0) {
    const item = data.Items[0]
    return { name: item.itemName, url: item.itemUrl }
  }

  return null
}
