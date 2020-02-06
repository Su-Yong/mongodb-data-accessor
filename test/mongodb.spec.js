const MongoDBDataAccessorFactory = require('../lib/mongodb-data-accessor-factory');
const generateId = require('../lib/util/generate-id');
const createMongoDBClient = require('./create-mongodb-client');

/* eslint-disable no-undef */

describe('model', () => {
  let client = null;
  beforeAll(async () => {
    client = await createMongoDBClient();
  });

  afterAll(async () => {
    await client.close();
    client = null;
  });

  test('insert element have key', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { id: generateId(), data: 'test' };
    await dataAccessor.create(element);
  });

  test('insert element not have key', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data: 'test' };
    await dataAccessor.create(element);
  });

  test('insert elements', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data: 'test1' };
    const element2 = { data: 'test2' };

    await dataAccessor.create(element1);
    await dataAccessor.create(element2);

    expect(await dataAccessor.findById(element1.id))
      .toEqual(element1);
    expect(await dataAccessor.findById(element2.id))
      .toEqual(element2);
  });

  test('find element have key', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { id: generateId(), data: 'test' };
    await dataAccessor.create(element);

    expect(await dataAccessor.findById(element.id))
      .toEqual(element);
  });

  test('find element not have key', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data: 'test' };
    await dataAccessor.create(element);

    expect(await dataAccessor.findById(element.id))
      .toEqual(element);
  });

  test('find element not have key with projection', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data1: 'test', data2: 'aaa' };
    await dataAccessor.create(element);

    expect(await dataAccessor.findById(element.id, { projection: ['data2'] }))
      .toEqual({ data2: element.data2 });
  });

  test('find element by query', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data1: 'test1', data2: 'test2' };
    await dataAccessor.create(element);

    expect(await dataAccessor.findOne({
      data1: 'test1',
    })).toEqual(element);
  });

  test('find all element', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data1: '1', data2: true };
    const element2 = { data1: '2', data2: true };
    const element3 = { data1: '2', data2: false };
    await dataAccessor.create(element1);
    await dataAccessor.create(element2);
    await dataAccessor.create(element3);

    expect(await dataAccessor.findAll({
      data1: '2',
    })).toEqual([element2, element3]);
    expect(await dataAccessor.findAll({
      data2: true,
    })).toEqual([element1, element2]);
  });

  test('exist element', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data1: 'test', data2: 'aaa' };
    await dataAccessor.create(element);

    expect(await dataAccessor.existById(element.id))
      .toEqual(true);
    expect(await dataAccessor.existById('other'))
      .toEqual(false);
  });

  test('update element', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data1: 'test1', data2: 'test2' };
    await dataAccessor.create(element);

    await dataAccessor.updateById(element.id, { data2: 'test3' });

    expect(await dataAccessor.findById(element.id))
      .toEqual({ id: element.id, data1: element.data1, data2: 'test3' });
  });

  test('update all element', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data1: 'test1', data2: false };
    const element2 = { data1: 'test1', data2: false };
    const element3 = { data1: 'test2', data2: false };
    await dataAccessor.create(element1);
    await dataAccessor.create(element2);
    await dataAccessor.create(element3);

    await dataAccessor.updateAll({ data1: 'test1' }, { data2: true });

    expect(await dataAccessor.findById(element1.id))
      .toEqual({ id: element1.id, data1: element1.data1, data2: true });
    expect(await dataAccessor.findById(element2.id))
      .toEqual({ id: element2.id, data1: element2.data1, data2: true });
    expect(await dataAccessor.findById(element3.id))
      .toEqual({ id: element3.id, data1: element3.data1, data2: false });
  });

  test('delete element', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data: 'test' };
    await dataAccessor.create(element);

    await dataAccessor.deleteById(element.id);

    expect(await dataAccessor.existById(element.id))
      .toEqual(false);
  });

  test('delete all element', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data: 'test1' };
    const element2 = { data: 'test2' };
    const element3 = { data: 'test2' };
    await dataAccessor.create(element1);
    await dataAccessor.create(element2);
    await dataAccessor.create(element3);

    await dataAccessor.deleteAll({ data: 'test2' });

    expect(await dataAccessor.existById(element1.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element2.id))
      .toEqual(false);
    expect(await dataAccessor.existById(element3.id))
      .toEqual(false);
  });

  test('bulk create element', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const id = generateId();

    await dataAccessor.bulkCreate([{
      insertOne: {
        document: {
          id,
          a: 1,
          b: true,
          c: 'test',
        },
      },
    }]);
    expect(await dataAccessor.findById(id))
      .toEqual({
        id, a: 1, b: true, c: 'test',
      });

    await dataAccessor.bulkCreate([{
      updateOne: {
        filter: {
          a: 1,
        },
        update: {
          $set: {
            a: 2,
          },
        },
      },
    }]);
    expect(await dataAccessor.exist({ a: 2, b: true, c: 'test' }))
      .toBe(true);

    await dataAccessor.bulkCreate([{
      deleteOne: {
        filter: {
          a: 2,
        },
      },
    }]);
    expect(await dataAccessor.exist({ a: 2, b: true, c: 'test' }))
      .toBe(false);
  });
});

/* eslint-enable no-undef */
