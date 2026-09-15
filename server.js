require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); 
const mysql = require('mysql2'); 
const jwt = require('jsonwebtoken');