export const devDb = {
  select: () => ({
    from: () => ({
      where: () => Promise.resolve([]),
      limit: () => Promise.resolve([]),
    }),
  }),
  insert: (table: any) => ({
    values: (values: any) => ({
      returning: () => Promise.resolve([values]),
    }),
  }),
  update: (table: any) => ({
    set: (values: any) => ({
      where: () => Promise.resolve(),
    }),
  }),
  delete: (table: any) => ({
    where: () => Promise.resolve(),
  }),
}
