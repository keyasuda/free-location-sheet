export type WarehouseItem = {
  klass: string,
  id: string,
  name: string,
  description: string,
  printed: boolean
}

export type Storage = WarehouseItem & {}

export type Belonging = WarehouseItem & {
  storage: string,
  quantities: number
}
