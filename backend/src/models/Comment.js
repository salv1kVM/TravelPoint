const { Model, DataTypes } = require('sequelize');

class Comment extends Model {
  static initModel(sequelize) {
    Comment.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000]
        }
      },
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Comment',
      timestamps: true,
      tableName: 'Comments'
    });
    
    return Comment;
  }
}

module.exports = Comment;