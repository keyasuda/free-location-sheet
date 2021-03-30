export type WarehouseItem = {
  id: string,
  name: string,
  description: string
}

export type Storage = WarehouseItem & {}

export type Belonging = WarehouseItem & {
  storage_id: string,
  inventories: number
}
