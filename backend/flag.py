import logging
import os


def flag_check(flag: str) -> bool:
    password = os.environ.get("password")
    if flag == password:
        return True
    else:
        logging.info("incorrect password detected")
        return False
