import argparse
import json
import os
import sys

import requests
from dotenv import load_dotenv


def json_query(query: dict, url: str):
    request_json = json.dumps(query)
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, data=request_json, headers=headers)
    if response.status_code == 200:
        response_json = response.json()
        return response_json
    else:
        raise Exception(f"Request failed with status code {response.status_code}")


def get_helius_api_key():
    load_dotenv()
    return os.environ['HELIUS_API_KEY']


def get_nft_info(helius_api_key: str, pub_key: str):
    return json_query(query={"mints": [pub_key]}, url=f'https://api.helius.xyz/v1/nfts?api-key={helius_api_key}')


def get_mint_list(helius_api_key: str, nft_info: dict):
    url = f'https://api.helius.xyz/v1/mintlist?api-key={helius_api_key}'
    data = {
        "query": {
            "verifiedCollectionAddresses": [nft_info["verifiedCollectionAddress"]]
        },
        "options": {
            "limit": 10000
        }
    }
    mint_list = []
    while True:
        result = json_query(data, url)
        mint_list.extend(result['result'])
        if not result['paginationToken']:
            break
        data['options']['paginationToken'] = result['paginationToken']
    return mint_list


def main() -> int:
    parser = argparse.ArgumentParser(description="Process an NFT with a given public key.")
    parser.add_argument("-nft", help="The NFT's public key as a string.", type=str)
    parser.add_argument("-o", help="The output directory (default: current working directory).",
                        type=str, default='.')

    args = parser.parse_args()
    nft_public_key = args.nft

    api_key = get_helius_api_key()

    nft_info = get_nft_info(api_key, nft_public_key)
    assert len(nft_info) == 1

    mint_list = get_mint_list(api_key, nft_info[0])

    with open(os.path.join(args.o, 'mint_list.json'), 'w') as f:
        json.dump(mint_list, f, indent=4)

    return 0


if __name__ == '__main__':
    sys.exit(main())
