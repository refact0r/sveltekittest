import clientPromise from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get(request) {
	try {
		const client = await clientPromise
		const db = client.db('Todos')
		const collection = db.collection('Todos')
		const todos = await collection.find({}).toArray()

		return {
			status: 200,
			body: {
				todos
			}
		}
	} catch (err) {
		console.log(err)
		return {
			status: 500,
			body: {
				error: 'An error occured'
			}
		}
	}
}

export async function post(request) {
	try {
		const client = await clientPromise
		const db = client.db('Todos')
		const collection = db.collection('Todos')
		const todo = JSON.parse(request.body)
		await collection.insertOne(todo)

		return {
			status: 200,
			body: {
				status: 'Success'
			}
		}
	} catch (err) {
		console.log(err)
		return {
			status: 500,
			body: {
				error: 'An error occured'
			}
		}
	}
}

export async function put(request) {
	try {
		const client = await clientPromise
		const db = client.db('Todos')
		const collection = db.collection('Todos')
		const todo = JSON.parse(request.body)
		await collection.update(
			{ _id: ObjectId(todo._id) },
			{ $set: { completed: todo.completed } }
		)

		return {
			status: 200,
			body: {
				status: 'Success'
			}
		}
	} catch (err) {
		console.log(err)
		return {
			status: 500,
			body: {
				error: 'An error occured'
			}
		}
	}
}

export async function del(request) {
	try {
		const client = await clientPromise
		const db = client.db('Todos')
		const collection = db.collection('Todos')
		const todo = JSON.parse(request.body)
		await collection.deleteOne({ _id: ObjectId(todo._id) })

		return {
			status: 200,
			body: {
				status: 'Success'
			}
		}
	} catch (err) {
		console.log(err)
		return {
			status: 500,
			body: {
				error: 'An error occured'
			}
		}
	}
}
