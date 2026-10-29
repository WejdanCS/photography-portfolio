export function createCatalogService(repository) {
  return {
    listPhotos: () => repository.listPhotos(),
    listServices: () => repository.listActiveServices(),
  };
}
