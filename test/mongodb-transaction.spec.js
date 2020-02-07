const MongoDBDataAccessorFactory = require('../lib/mongodb-data-accessor-factory');
const generateId = require('../lib/util/generate-id');
const createMongoDBClient = require('./create-mongodb-client');

/* eslint-disable no-undef */

describe('transaction', () => {
  let client = null;
  beforeAll(async () => {
    client = await createMongoDBClient();
  });

  afterAll(async () => {
    await client.close();
    client = null;
  });

  test('insert element: failed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const transaction = await dataAccessor.createTransaction();

    const id1 = generateId();
    const id2 = generateId();
    const element1 = { id: id1, data: 'test1' };
    const element2 = { id: id1, data: 'test2' };
    const element3 = { id: id2, data: 'test2' };

    try {
      await dataAccessor.create(element1, { transaction });
      await dataAccessor.create(element2, { transaction });
      await dataAccessor.create(element3, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    } finally {
      expect(await dataAccessor.existById(element1.id))
        .toBe(false);
      expect(await dataAccessor.existById(element2.id))
        .toBe(false);
      expect(await dataAccessor.existById(element3.id))
        .toBe(false);
    }
  });

  test('insert element: succeed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const transaction = await dataAccessor.createTransaction();

    const element1 = { data: 'test1' };
    const element2 = { data: 'test2' };
    try {
      await dataAccessor.create(element1, { transaction });
      await dataAccessor.create(element2, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    } finally {
      expect(await dataAccessor.existById(element1.id))
        .toBe(true);
      expect(await dataAccessor.existById(element2.id))
        .toBe(true);
    }
  });

  test('inserts element: failed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const id = generateId();

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.bulkCreate([{
        insertOne: {
          document: {
            id,
            a: 1,
            b: true,
            c: 'test',
          },
        },
      }], { transaction });

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
      }], { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    } finally {
      expect(await dataAccessor.exist({ a: 1, b: true, c: 'test' }))
        .toBe(false);
    }
  });

  test('inserts element: succeed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const id = generateId();

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.bulkCreate([{
        insertOne: {
          document: {
            id,
            a: 1,
            b: true,
            c: 'test',
          },
        },
      }], { transaction });

      await dataAccessor.bulkCreate([{
        updateOne: {
          filter: {
            id: generateId(),
            a: 1,
          },
          update: {
            $set: {
              a: 2,
            },
          },
        },
      }], { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    } finally {
      expect(await dataAccessor.exist({ a: 2, b: true, c: 'test' }))
        .toBe(true);
    }
  });

  test('update element: failed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data1: 'test1', data2: 'test2' };
    await dataAccessor.create(element);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.updateById(generateId(), { data2: 'test3' }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    } finally {
      expect(await dataAccessor.existById(element.id))
        .toBe(true);
      expect(await dataAccessor.findById(element.id))
        .toEqual({ id: element.id, data1: 'test1', data2: 'test2' });
    }
  });

  test('update element: succeed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data1: 'test1', data2: 'test2' };
    await dataAccessor.create(element);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.updateById(element.id, { data2: 'test3' }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    } finally {
      expect(await dataAccessor.existById(element.id))
        .toBe(true);
      expect(await dataAccessor.findById(element.id))
        .toEqual({ id: element.id, data1: 'test1', data2: 'test3' });
    }
  });

  test('update all element: failed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data1: 'test1', data2: false };
    const element2 = { data1: 'test1', data2: false };
    const element3 = { data1: 'test2', data2: false };

    await dataAccessor.create(element1);
    await dataAccessor.create(element2);
    await dataAccessor.create(element3);

    expect(await dataAccessor.findById(element1.id))
      .toEqual(element1);
    expect(await dataAccessor.findById(element2.id))
      .toEqual(element2);
    expect(await dataAccessor.findById(element3.id))
      .toEqual(element3);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.updateAll({ data1: 'test3' }, { data2: true }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    }

    expect(await dataAccessor.findById(element1.id))
      .toEqual({ id: element1.id, data1: element1.data1, data2: false });
    expect(await dataAccessor.findById(element2.id))
      .toEqual({ id: element2.id, data1: element2.data1, data2: false });
    expect(await dataAccessor.findById(element3.id))
      .toEqual({ id: element3.id, data1: element3.data1, data2: false });
  });

  test('update all element: succeed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data1: 'test1', data2: false };
    const element2 = { data1: 'test1', data2: false };
    const element3 = { data1: 'test2', data2: false };

    await dataAccessor.create(element1);
    await dataAccessor.create(element2);
    await dataAccessor.create(element3);

    expect(await dataAccessor.findById(element1.id))
      .toEqual(element1);
    expect(await dataAccessor.findById(element2.id))
      .toEqual(element2);
    expect(await dataAccessor.findById(element3.id))
      .toEqual(element3);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.updateAll({ data1: 'test1' }, { data2: true }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    }

    expect(await dataAccessor.findById(element1.id))
      .toEqual({ id: element1.id, data1: element1.data1, data2: true });
    expect(await dataAccessor.findById(element2.id))
      .toEqual({ id: element2.id, data1: element2.data1, data2: true });
    expect(await dataAccessor.findById(element3.id))
      .toEqual({ id: element3.id, data1: element3.data1, data2: false });
  });

  test('delete element: failed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data: 'test' };
    await dataAccessor.create(element);

    expect(await dataAccessor.existById(element.id))
      .toEqual(true);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.deleteById(generateId(), { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    }

    expect(await dataAccessor.existById(element.id))
      .toEqual(true);
  });

  test('delete element: succeed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element = { data: 'test' };
    await dataAccessor.create(element);

    expect(await dataAccessor.existById(element.id))
      .toEqual(true);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.deleteById(element.id, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    }

    expect(await dataAccessor.existById(element.id))
      .toEqual(false);
  });

  test('delete all element: failed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data: 'test1' };
    const element2 = { data: 'test2' };
    const element3 = { data: 'test2' };
    await dataAccessor.create(element1);
    await dataAccessor.create(element2);
    await dataAccessor.create(element3);

    expect(await dataAccessor.existById(element1.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element2.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element3.id))
      .toEqual(true);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.deleteAll({ data: 'test3' }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    }

    expect(await dataAccessor.existById(element1.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element2.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element3.id))
      .toEqual(true);
  });

  test('delete all element: succeed', async () => {
    const dataAccessorFactory = new MongoDBDataAccessorFactory(client);
    const dataAccessor = dataAccessorFactory.create('test');

    const element1 = { data: 'test1' };
    const element2 = { data: 'test2' };
    const element3 = { data: 'test2' };
    await dataAccessor.create(element1);
    await dataAccessor.create(element2);
    await dataAccessor.create(element3);

    expect(await dataAccessor.existById(element1.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element2.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element3.id))
      .toEqual(true);

    const transaction = await dataAccessor.createTransaction();

    try {
      await dataAccessor.deleteAll({ data: 'test2' }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback(err);
    }

    expect(await dataAccessor.existById(element1.id))
      .toEqual(true);
    expect(await dataAccessor.existById(element2.id))
      .toEqual(false);
    expect(await dataAccessor.existById(element3.id))
      .toEqual(false);
  });
});

/* eslint-enable no-undef */
