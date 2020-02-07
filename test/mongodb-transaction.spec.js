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

  test('test insert element transaction: failed', async () => {
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

  test('test insert element transaction: succeed', async () => {
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
});

/* eslint-enable no-undef */
