from webapp import app
from socket_io import io


if __name__ == '__main__':
    io.run(app, debug=True)
