require('dotenv').config(); // Load environment variables
const { Sequelize, DataTypes, Op } = require('sequelize');

// Use DATABASE_URL or throw an error if not defined
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Please check your .env file.');
}

// Initialize Sequelize with the connection string
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Disable strict SSL validation for Neon
    },
  },
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  });

// Define the Theme model
const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// Define the Set model
const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    num_parts: {
      type: DataTypes.INTEGER,
    },
    theme_id: {
      type: DataTypes.INTEGER,
    },
    img_url: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
  }
);

// Define associations
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize the database
async function initialize() {
  try {
    await sequelize.sync();
    console.log('Database initialized successfully.');
    return 'Database initialized successfully.';
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    throw new Error(`Failed to initialize database: ${err.message}`);
  }
}

// Function to get all sets
async function getAllSets() {
  try {
    const sets = await Set.findAll({ include: [Theme] });
    return sets;
  } catch (err) {
    throw new Error(`Failed to retrieve sets: ${err.message}`);
  }
}

// Function to get a specific set by set_num
async function getSetByNum(setNum) {
  try {
    const set = await Set.findOne({
      where: { set_num: setNum },
      include: [Theme],
    });
    if (!set) throw new Error('Set not found.');
    return set;
  } catch (err) {
    throw new Error(`Failed to retrieve set: ${err.message}`);
  }
}

// Function to get sets by theme
async function getSetsByTheme(theme) {
  try {
    const sets = await Set.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': { [Op.iLike]: `%${theme}%` },
      },
    });
    if (!sets.length) throw new Error(`No sets found for theme: ${theme}`);
    return sets;
  } catch (err) {
    throw new Error(`Failed to retrieve sets: ${err.message}`);
  }
}

// Function to add a set
async function addSet(setData) {
  try {
    await Set.create(setData);
    return 'Set added successfully.';
  } catch (err) {
    throw new Error(`Failed to add set: ${err.message}`);
  }
}

// Function to get all themes
async function getAllThemes() {
  try {
    const themes = await Theme.findAll();
    return themes;
  } catch (err) {
    throw new Error(`Failed to retrieve themes: ${err.message}`);
  }
}

// Function to edit a set
async function editSet(set_num, setData) {
  try {
    const [updated] = await Set.update(setData, { where: { set_num } });
    if (!updated) throw new Error('Set not found.');
    return 'Set updated successfully.';
  } catch (err) {
    throw new Error(`Failed to update set: ${err.message}`);
  }
}

// Function to delete a set
async function deleteSet(set_num) {
  try {
    const deleted = await Set.destroy({ where: { set_num } });
    if (!deleted) throw new Error('Set not found.');
    return 'Set deleted successfully.';
  } catch (err) {
    throw new Error(`Failed to delete set: ${err.message}`);
  }
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
};
