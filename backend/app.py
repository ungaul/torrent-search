from flask import Flask, jsonify, request, send_from_directory
from py1337x import py1337x

app = Flask(__name__, static_folder='static', static_url_path='/static')

# Initialize py1337x
torrents = py1337x(proxy='1337x.to')

# Route to serve index.html
@app.route('/')
def serve_index():
    return send_from_directory('templates', 'index.html')

# Route for searching torrents
@app.route('/search')
def search_torrents():
    query = request.args.get('query')
    page = request.args.get('page', 1, type=int)
    sort_by = request.args.get('sortBy', 'seeders')
    order = request.args.get('order', 'desc')
    category = request.args.get('category')

    if not query:
        return jsonify({'error': 'Query parameter is missing'}), 400

    # Perform search with provided sorting and category
    result = torrents.search(query, page=page, sortBy=sort_by, order=order, category=category)

    # For each torrent, retrieve additional information including the magnet link and upload date
    for item in result['items']:
        torrent_info = torrents.info(link=item['link'])  # Fetch detailed info using the torrent link
        item['magnetLink'] = torrent_info.get('magnetLink', '#')  # Add magnet link
        item['uploadDate'] = torrent_info.get('uploadDate', 'Unknown')  # Add upload date

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
