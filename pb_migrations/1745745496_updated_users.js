/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_');

    // update collection data
    unmarshal(
      {
        deleteRule: '@request.auth.isAdmin = true',
        listRule: '@request.auth.isAdmin = true',
        updateRule: '@request.auth.isAdmin = true',
        viewRule: '@request.auth.id = id || @request.auth.isAdmin = true',
      },
      collection
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_');

    // update collection data
    unmarshal(
      {
        deleteRule: 'id = @request.auth.id',
        listRule: 'id = @request.auth.id',
        updateRule: 'id = @request.auth.id',
        viewRule: 'id = @request.auth.id',
      },
      collection
    );

    return app.save(collection);
  }
);
