import mongoose from 'mongoose'

export const connectToDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/customerdb'

    try {
        await mongoose.connect(mongoUri, {
            dbName: 'customerdb',
            autoIndex: true,
            maxPoolSize: 10,
        })

        console.log('Connected to MongoDB at', mongoUri)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        process.exit(1)
    }

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB connection lost')
    })

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err)
    })
}
