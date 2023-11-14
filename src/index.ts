import 'dotenv/config'
import { MongoClient, ClientSession } from 'mongodb';

async function runTransaction(): Promise<void> {
  const uri: string | undefined = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  const client: MongoClient = new MongoClient(uri);
  let session: ClientSession | undefined

  try {
    // connect to mongodb
    await client.connect();

    // Start a ClientSession
    session = client.startSession();
    session.startTransaction();

    // get the collection we will be using
    const balanceCollection = client.db('bank').collection('balance');

    // Steve Jobs is transferring $50 to Bill Gates

    // Removing $50 from Steve Jobs' balance
    await balanceCollection.updateOne(
      { name: "Steve Jobs" },
      { $inc: { balance: -50 } },
      { session }
    );

    // Simulating an error
    if (1 === 1) {
      throw new Error('Something went wrong');
    }

    // Adding $50 to Bill Gates' balance
    await balanceCollection.updateOne(
      { name: "Bill Gates" },
      { $inc: { balance: 50 } },
      { session }
    );


    // Commit transaction
    await session.commitTransaction();
    console.log('Transaction completed successfully');
  } catch (error) {
    console.error('Transaction failed: ', error);
  } finally {
    if (session) {
      // EndSession marks the transaction as expired.
      // So if you havent committed the transaction, it will be aborted.
      await session.endSession();
    }
    await client.close();
  }
}

runTransaction().catch(console.error);
