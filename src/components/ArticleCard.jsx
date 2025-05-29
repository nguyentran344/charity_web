import React from 'react';

const ArticleCard = ({ article }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold">{article.title}</h3>
      <p>{article.content}</p>
    </div>
  );
};

export default ArticleCard;