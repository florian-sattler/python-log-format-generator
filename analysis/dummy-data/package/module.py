import logging
import time


class Class:
    def __init__(self) -> None:
        self.logger = logging.getLogger("classlogger")
        logging.debug("initialized class")

    def method(self) -> None:
        self.logger.warning("something might not be right in this class")


def function():
    logger = logging.getLogger("modulelogger")
    logger.info("entering a function")
    time.sleep(1.5)
    logger.info("leaving a function")
