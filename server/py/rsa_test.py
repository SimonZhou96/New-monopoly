import rsa
import base64
from time import sleep
import sys
import select

(public_key, private_key) = rsa.newkeys(1024)

# print public_key.save_pkcs1()
# print private_key.save_pkcs1()

while True:
    sleep(1.0/60.0)
    # str = input("input:\n")
    inputs = [sys.stdin]
    rs, ws, es = select.select(inputs, [], [])
    for r in rs:
        if r is sys.stdin:
            print r