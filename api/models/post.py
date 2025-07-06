from models import db


class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    url_key = db.Column(db.String(120), unique=True, nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)

    def to_dict(self):
        result = self.to_dict_summary()
        result['content'] = self.content
        return result

    def to_dict_summary(self):
        return {
            'id': self.id,
            'url_key': self.url_key,
            'title': self.title,
            'published_at': self.published_at.isoformat() if self.published_at else None,
        }
