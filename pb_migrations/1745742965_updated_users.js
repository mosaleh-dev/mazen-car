/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_');

    // update collection data
    unmarshal(
      {
        authAlert: {
          enabled: false,
        },
        oauth2: {
          mappedFields: {
            name: '',
          },
        },
      },
      collection
    );

    // add field
    collection.fields.addAt(
      7,
      new Field({
        autogeneratePattern: '',
        hidden: false,
        id: 'text2434144904',
        max: 0,
        min: 0,
        name: 'lastName',
        pattern: '',
        presentable: false,
        primaryKey: false,
        required: true,
        system: false,
        type: 'text',
      })
    );

    // add field
    collection.fields.addAt(
      9,
      new Field({
        hidden: false,
        id: 'number3898508260',
        max: null,
        min: null,
        name: 'phoneNumber',
        onlyInt: true,
        presentable: false,
        required: true,
        system: false,
        type: 'number',
      })
    );

    // add field
    collection.fields.addAt(
      10,
      new Field({
        hidden: false,
        id: 'bool2165931080',
        name: 'isAdmin',
        presentable: false,
        required: false,
        system: false,
        type: 'bool',
      })
    );

    // add field
    collection.fields.addAt(
      11,
      new Field({
        hidden: false,
        id: 'number656136322',
        max: null,
        min: null,
        name: 'nationalId',
        onlyInt: true,
        presentable: false,
        required: true,
        system: false,
        type: 'number',
      })
    );

    // update field
    collection.fields.addAt(
      6,
      new Field({
        autogeneratePattern: '',
        hidden: false,
        id: 'text1579384326',
        max: 255,
        min: 0,
        name: 'firstName',
        pattern: '',
        presentable: false,
        primaryKey: false,
        required: true,
        system: false,
        type: 'text',
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_');

    // update collection data
    unmarshal(
      {
        authAlert: {
          enabled: true,
        },
        oauth2: {
          mappedFields: {
            name: 'name',
          },
        },
      },
      collection
    );

    // remove field
    collection.fields.removeById('text2434144904');

    // remove field
    collection.fields.removeById('number3898508260');

    // remove field
    collection.fields.removeById('bool2165931080');

    // remove field
    collection.fields.removeById('number656136322');

    // update field
    collection.fields.addAt(
      6,
      new Field({
        autogeneratePattern: '',
        hidden: false,
        id: 'text1579384326',
        max: 255,
        min: 0,
        name: 'name',
        pattern: '',
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: 'text',
      })
    );

    return app.save(collection);
  }
);
