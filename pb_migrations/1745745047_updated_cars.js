/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_2999614116');

    // update collection data
    unmarshal(
      {
        createRule: '@request.auth.isAdmin = true',
        deleteRule: '@request.auth.isAdmin = true',
        listRule: '',
        updateRule: '@request.auth.isAdmin = true',
        viewRule: '',
      },
      collection
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_2999614116');

    // update collection data
    unmarshal(
      {
        createRule: null,
        deleteRule: null,
        listRule: null,
        updateRule: null,
        viewRule: null,
      },
      collection
    );

    return app.save(collection);
  }
);
