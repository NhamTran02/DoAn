import sys
import logging
import psycopg2
from apify_client import ApifyClient
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DB_CONFIG_CRAWLER = {
    "host": "localhost",
    "port": "5432",
    "database": "crawler_posts",
    "user": "postgres",
    "password": "0311"
}

def run_apify_actor(api_token, actor_id, input_data):
    try:
        client = ApifyClient(api_token)
        logger.info(f"Đang chạy actor: {actor_id} với input: {input_data}")
        run = client.actor(actor_id).call(run_input=input_data, timeout_secs=3600)
        if not run:
            logger.error("Actor không trả về kết quả")
            raise Exception("Actor không trả về kết quả")
        dataset_id = run.get("defaultDatasetId")
        if not dataset_id:
            logger.error("Không lấy được dataset ID từ actor")
            raise Exception("Không lấy được dataset ID từ actor")
        logger.info(f"Actor đã chạy xong. Dataset ID: {dataset_id}")
        return dataset_id
    except Exception as e:
        logger.error(f"Lỗi khi chạy actor: {str(e)}")
        raise

def fetch_apify_data(api_token, dataset_id, num_posts):
    try:
        client = ApifyClient(api_token)
        logger.info(f"Đang lấy dữ liệu từ dataset: {dataset_id}")
        dataset = client.dataset(dataset_id)
        dataset_items = list(dataset.iterate_items())
        dataset_size = len(dataset_items)
        logger.info(f"Dataset có {dataset_size} bài viết")

        if dataset_size == 0:
            logger.warning("Dataset rỗng, không có bài viết nào được crawl")
            return []

        new_posts = []
        for item in dataset_items[:num_posts]:
            url = item.get('url', 'No URL available')
            text = item.get('text', 'No text available')
            new_posts.append({"url": url, "text": text})
            logger.info(f"Đã crawl bài viết: {text[:50]}... (URL: {url})")

        return new_posts
    except Exception as e:
        logger.error(f"Lỗi khi lấy dữ liệu từ Apify: {str(e)}")
        raise

def connect_to_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG_CRAWLER)
        logger.info("Kết nối đến PostgreSQL (crawler_posts) thành công")
        return conn
    except Exception as e:
        logger.error(f"Lỗi khi kết nối đến PostgreSQL (crawler_posts): {str(e)}")
        raise

def get_all_urls(conn):
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT url FROM crawler_posts")
            urls = {row[0] for row in cur.fetchall()}
        logger.info(f"Đã lấy {len(urls)} URL từ crawler_posts")
        return urls
    except Exception as e:
        logger.error(f"Lỗi khi lấy URL từ crawler_posts: {str(e)}")
        raise

def save_to_posts(conn, url: str, text: str):
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO crawler_posts (url, text) VALUES (%s, %s) RETURNING id",
                (url, text)
            )
            row = cur.fetchone()
            if row:
                logger.info(f"Đã lưu bài viết vào bảng crawler_posts: {text[:50]}... (URL: {url}, ID: {row[0]})")
            else:
                logger.warning(f"Không lưu được dữ liệu vào crawler_posts: {url}")
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Lỗi khi lưu bài viết vào bảng crawler_posts: {str(e)}")
        raise

def crawl_and_save(num_posts: int, fanpage_link: str):
    try:
        if num_posts <= 0:
            raise ValueError("Số lượng bài viết phải lớn hơn 0")
        if not fanpage_link:
            raise ValueError("Link fanpage không được để trống")

        API_TOKEN = "apify_api_y8pZBeaahzp3zBqEok52yV9Ug3b78k0gY6pq"
        ACTOR_ID = "apify/facebook-posts-scraper"
        logger.info(f"Sử dụng actor: {ACTOR_ID} cho {fanpage_link}")

        INPUT_DATA = {
            "startUrls": [{"url": fanpage_link, "method": "GET"}],
            "resultsLimit": num_posts,
            "proxyConfiguration": {"useApifyProxy": True, "apifyProxyGroups": ["AUTO"]}
        }
        dataset_id = run_apify_actor(API_TOKEN, ACTOR_ID, INPUT_DATA)
        crawled_posts = fetch_apify_data(API_TOKEN, dataset_id, num_posts)

        if len(crawled_posts) < num_posts:
            logger.warning(f"Chỉ crawl được {len(crawled_posts)}/{num_posts} bài viết, có thể đã hết bài mới trên fanpage.")

        return crawled_posts
    except Exception as e:
        logger.error(f"Lỗi trong crawl_and_save: {str(e)}")
        raise

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python crawler.py <num_posts> <fanpage_link>")
        sys.exit(1)
    try:
        num_posts = int(sys.argv[1])
        fanpage_link = sys.argv[2]
        crawled_posts = crawl_and_save(num_posts, fanpage_link)
        print(json.dumps(crawled_posts))
    except ValueError as e:
        print(f"Lỗi: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Lỗi khi chạy crawler: {str(e)}", file=sys.stderr)
        sys.exit(1)