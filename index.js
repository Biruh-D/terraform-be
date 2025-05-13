// Load env first
require('dotenv').config();

/* third-party packages */
const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');
const aws        = require('aws-sdk');
const cors       = require('cors');

// Configure AWS SDK
aws.config.update({ region: process.env.AWS_REGION });

// Database via Sequelize
const sequelize = require('./util/database');
// If you still need raw connections, configure here
// const connection = require('./util/mysql');

// Models & Routes
const User     = require('./models/user');
const Resource = require('./models/resource');
const MyList   = require('./models/mylist');
const userRoutes     = require('./routes/user');
const resourceRoutes = require('./routes/resource');

const app = express();
app.set('trust proxy', true);
app.use(cors({
  origin: 'https://resourcexchange.net',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

app.use(userRoutes);
app.use(resourceRoutes);

// Associations
User.hasMany(Resource,{ foreignKey:'userId' });
Resource.belongsTo(User,{ foreignKey:'userId' });
User.hasMany(MyList,{ foreignKey:'userId' });
MyList.belongsTo(User,{ foreignKey:'userId' });
Resource.hasMany(MyList,{ foreignKey:'resourceId' });
MyList.belongsTo(Resource,{ foreignKey:'resourceId' });

// Start server after sync
sequelize.sync()
  .then(() => app.listen(3000, () => console.log('Server listening on port 3000')))
  .catch(err => console.error('Sync error:', err));
