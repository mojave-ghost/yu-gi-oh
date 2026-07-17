const express    = require('express')
const cardsRoute      = require('./routes/cards')
const setsRoute       = require('./routes/sets')
const archetypesRoute = require('./routes/archetypes')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use('/api/cards',      cardsRoute)
app.use('/api/sets',       setsRoute)
app.use('/api/archetypes', archetypesRoute)

app.listen(PORT, () => console.log(`Server running on :${PORT}`))
