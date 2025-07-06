import logging
import os

from flask import Flask, jsonify
from flask_migrate import Migrate

from controllers import init_controllers
from models import db

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@app.errorhandler(Exception)
def handle_exception(e):
    logger.exception("An error occurred during a request:")
    return {"error": str(e)}, 500


app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///blog.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

migrate = Migrate(app, db)


@app.route('/', methods=['GET'])
def test():
    return jsonify({
        "status": "ok",
        "message": "API is working"
    })


init_controllers(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
