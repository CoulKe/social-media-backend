import mongoose from "mongoose";

const connectDB = async () => {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.CLUSTER}.gyo32.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

  try {
    let conn = (!process.env?.NODE_ENV) ? await mongoose.connect("mongodb://127.0.0.1:27017/Socializer",{
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    ) : await mongoose.connect(uri,{
          useUnifiedTopology: true,
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
        }
      );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
