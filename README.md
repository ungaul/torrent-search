
# 📁 Torrent Search

**Torrent Search** is a web-based application that allows users to search for torrents across multiple sources. Currently, it only indexes torrents from **1337x**, but the goal is to expand and include several popular torrenting sites in the future.

## 🚀 Features

- 🔍 **Search torrents** using keywords and categories.
- ⬇️ **Download via magnet links** directly from the results.
- 📊 **Sort results** by seeders, leechers, file size, or upload date.
- 📄 **Lazy loading**: Load more results as you scroll or via a button.
- 🎛️ **Customizable result limits**: Choose how many results to load at a time.

## 📋 Requirements

To use and contribute to this project, you need to install the following dependencies:

- **Python** (version 3.x)
- **1337x API** (py1337x)

## ⚙️ Installation

### Install via PyPi

You can install the necessary libraries using pip:

```bash
pip install 1337x
```

### Install from the Source

Clone the 1337x project repository and install it from the source:

```bash
git clone https://github.com/hemantapkh/1337x
cd 1337x
python setup.py sdist
pip install dist/*
```

Once installed, you can clone this repository to set up **Torrent Search**:

```bash
git clone https://github.com/ungaul/torrent-search
cd torrent-search
```

## 💻 Usage

To run the web server locally, navigate to the project directory and run:

```bash
python app.py
```

Then, open your browser and go to [http://127.0.0.1:5000](http://127.0.0.1:5000) to start searching for torrents.

## 🛠️ How to Contribute

This project is a work in progress, and contributions are welcome! You can contribute by:

- Adding new torrenting sources.
- Improving the UI/UX of the web interface.
- Adding new features like filters, sorting options, etc.

### Steps to Contribute

1. Fork this repository.
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request.

## 📚 API Documentation

This project relies on the **py1337x** API to search for torrents. Here's an example of how to use the API:

```python
from py1337x import py1337x

# Search torrents
torrents = py1337x(proxy='1337x.to')
result = torrents.search('photoshop', category='apps', sortBy='seeders', order='desc')
```

For more detailed API documentation, visit the official [py1337x repository](https://github.com/hemantapkh/1337x).

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for more details.
