import mongoose from 'mongoose';
const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('Connected to Database'));
    mongoose.connection.on('error', (err) => console.error(`MongoDB connection error: ${err}`));

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/lms`);
    } catch (error) {
        console.error(`Failed to connect to MongoDB: ${error.message}`);
    }
};
export default connectDB;