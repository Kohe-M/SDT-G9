"""
iPhone 17 レスポンシブモードでスクリーンショットを撮影するスクリプト
"""
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# iPhone 17 の想定スペック（iPhone 16 Pro ベース: 393x852 pt / scale 3x）
IPHONE_17 = {
    "deviceMetrics": {
        "width": 393,
        "height": 852,
        "pixelRatio": 3.0,
        "touch": True,
    },
    "userAgent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) "
        "Version/18.4 Mobile/15E148 Safari/604.1"
    ),
}

BASE_URL = "http://localhost:5173"

# HashRouter なので # ルーティング
PAGES = [
    ("01_home",      BASE_URL + "/#/"),
    ("02_timetable", BASE_URL + "/#/timetable"),
    ("03_profile",   BASE_URL + "/#/profile"),
    ("04_matching",  BASE_URL + "/#/matching/53382"),
]

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def make_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")

    # iPhone 17 モバイルエミュレーション
    opts.add_experimental_option("mobileEmulation", IPHONE_17)

    driver = webdriver.Chrome(options=opts)
    driver.set_window_size(IPHONE_17["deviceMetrics"]["width"], IPHONE_17["deviceMetrics"]["height"])
    return driver


def screenshot(driver, name, url):
    driver.get(url)
    time.sleep(1.5)  # JS描画待ち

    # ページ全体の高さに合わせてウィンドウを伸ばしてからキャプチャ
    total_height = driver.execute_script("return document.body.scrollHeight")
    driver.set_window_size(IPHONE_17["deviceMetrics"]["width"], max(total_height, IPHONE_17["deviceMetrics"]["height"]))
    time.sleep(0.3)

    path = os.path.join(OUTPUT_DIR, f"{name}.png")
    driver.save_screenshot(path)
    print(f"  ✓ {name}.png  ({url})")


def main():
    print("=== スクリーンショット撮影開始（iPhone 17 モード）===")
    driver = make_driver()
    try:
        for name, url in PAGES:
            screenshot(driver, name, url)
    finally:
        driver.quit()
    print(f"\n保存先: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
