/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_2999614116');

    // add field
    collection.fields.addAt(
      12,
      new Field({
        hidden: false,
        id: 'select2139560351',
        maxSelect: 1,
        name: 'transmission',
        presentable: false,
        required: true,
        system: false,
        type: 'select',
        values: ['manual', 'automatic'],
      })
    );

    // add field
    collection.fields.addAt(
      13,
      new Field({
        hidden: false,
        id: 'select834498537',
        maxSelect: 1,
        name: 'fuel',
        presentable: false,
        required: true,
        system: false,
        type: 'select',
        values: ['petrol', 'gas', 'electric', 'diesel', 'hybrid'],
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_2999614116');

    // remove field
    collection.fields.removeById('select2139560351');

    // remove field
    collection.fields.removeById('select834498537');

    return app.save(collection);
  }
);
