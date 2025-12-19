const { Model, DataTypes } = require('sequelize');

class Article extends Model {
  static initModel(sequelize) {
    Article.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      excerpt: {
        type: DataTypes.STRING(500)
      },
      imageUrl: {
        type: DataTypes.STRING
      },
      category: {
        type: DataTypes.STRING
      },
      readTime: {
        type: DataTypes.INTEGER,
        defaultValue: 5
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Article',
      timestamps: true
    });
  }
}

module.exports = Article;