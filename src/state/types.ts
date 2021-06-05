export type WarehouseItem = {
  klass: string
  id: string
  name: string
  description: string
  printed: boolean
  deadline: string
}

export type Storage = WarehouseItem & {}

export type Belonging = WarehouseItem & {
  storageId: string
  quantities: number
}
