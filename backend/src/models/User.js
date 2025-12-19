const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static initModel(sequelize) {
    User.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('USER', 'ADMIN'),
        defaultValue: 'USER'
      }
    }, {
      sequelize,
      modelName: 'User',
      timestamps: true
    });
  }
}

module.exports = User;