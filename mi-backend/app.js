require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var safezonesRouter = require('./routes/safezones'); // ✅ importar ruta de zonas
var userReviewRouter = require('./routes/users-reviews');
var safeZoneInvitationRouter = require('./routes/safeZoneUsers');

var app = express();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    ssl: true,
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conectado a la base de datos Supabase'))
  .catch(err => console.error('❌ Error de conexión a la base de datos:', err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/safezones', safezonesRouter); // ✅ usar la ruta aquí
app.use('/user-review', userReviewRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/safe-zone-invitation', safeZoneInvitationRouter);

module.exports = app;
