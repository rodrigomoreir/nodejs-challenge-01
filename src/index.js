const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "User not found" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(user => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({ error: "user already exists!" })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).json(users[0])

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newToDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newToDo)

  return response.status(201).json(newToDo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "todo  doesn't exists!" })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  // const todoIsEqual = user.todos.some(todo => {
  //   if (todo.id === id) {
  //     todo.title = title
  //     todo.deadline = new Date(deadline)
  //     return true
  //   } else {
  //     return false
  //   }
  // })

  // if (!todoIsEqual) {
  //   return response.status(400).json({ error: "todo  doesn't exists!" })
  // }

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  // const todo = user.todos.find(todo => todo.id === id)
  // if (!todo) {
  //   return response.status(404).json({ error: "todo  doesn't exists!" })
  // }
  // user.todos.splice(todo)

  const todoIsEqual = user.todos.some(todo => {
    if (todo.id === id) {
      user.todos.splice(todo)
      return true
    } else {
      return false
    }
  })
  if (!todoIsEqual) {
    return response.status(404).json({ error: "todo  doesn't exists!" })
  }

  return response.status(204).json()
});

module.exports = app;