import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;



app.use(bodyParser.json());


if (process.env.NODE_ENV === 'production') {


    const corsOptions = {
        origin: [
            'https://tal0311.github.io',
            'https://tal0311.github.io/morena-food-list',
        ],
        optionsSuccessStatus: 200,
    };
    app.use(cors(corsOptions));
} else {
    app.use(cors());
}



let items = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
    { id: '4', name: 'Item 4' },
    { id: '5', name: 'Item 5' },
];

// Create
app.post('/api/items', (req, res) => {
    
    
    res.status(201).json({ id: items.length + 1, ...req.body });
});

// Read All
app.get('/api/items', (req, res) => {
    
    // console.log(req.headers.origin);
    res.json({ items, origin: req.headers.origin });
});

// Read One
app.get('/api/items/:id', (req, res) => {
    const item = items.find(i => i.id === req.params.id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).send('Item not found');
    }
});

// Update
app.put('/api/items/:id', (req, res) => {
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    if (index !== -1) {
        items[index] = { id: parseInt(req.params.id), ...req.body };
        res.json(items[index]);
    } else {
        res.status(404).send('Item not found');
    }
});

// Delete
app.delete('/api/items/:id', (req, res) => {
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    if (index !== -1) {
        const deletedItem = items.splice(index, 1);
        res.json(deletedItem);
    } else {
        res.status(404).send('Item not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
