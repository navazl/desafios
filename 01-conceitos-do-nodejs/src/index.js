const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const usernameAlreadyExists = users.some(user => user.username === username)

  if (!usernameAlreadyExists) {
    return response.status(404).json({error: "O usuário não existe"})
  }

  request.username = username;

  return next();
  




}

app.post('/users', (request, response) => {
  const { name, username} = request.body;

  const usernameAlreadyExists = users.some(user => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({error: "O usuário já existe"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const allTodos = users.find(user => user.username === username).todos;

  return response.status(200).json(allTodos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const user = users.find(user => user.username === username);

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { title, deadline } = request.body;

  const { id } = request.params;

  const changeTodo = users.find(user => user.username === username).todos.find(todo => todo.id === id)

  if(!changeTodo)
    return response.status(404).json({error: "Não existe uma todo com esse ID :("})

  changeTodo["title"] = title;
  changeTodo["deadline"] = new Date(deadline);
  
  return response.status(200).json(changeTodo)

  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { id } = request.params;

  const todo = users.find(user => user.username === username).todos.find(todo => todo.id === id)

  if(!todo)
    return response.status(404).json({error: "Não existe uma todo com esse ID :("})

  todo.done = true;
  return response.status(200).json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { id } = request.params;

  const userTodos = users.find(user => user.username === username).todos;

  if (!userTodos.some(todo => todo.id === id))
    return response.status(404).json({error: "Não existe uma todo com esse ID :("})
  
  userTodos.splice(userTodos.findIndex(todo => todo.id === id), 1)

  return response.status(204).json();

  
});

module.exports = app;