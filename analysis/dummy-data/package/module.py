import logging


class Class:
    def __init__(self) -> None:
        self.logger = logging.getLogger("classlogger")

    def method(self) -> None:
        self.logger.warning("something might not be right in this class")


def function():
    logger = logging.getLogger("modulelogger")
    logger.info("some message inside a function")
