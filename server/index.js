const express    = require('express')
const cardsRoute = require('./routes/cards')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use('/api/cards', cardsRoute)

app.listen(PORT, () => console.log(`Server running on :${PORT}`))
