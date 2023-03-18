import logging
import logging.config

import package.module


if __name__ == "__main__":
    logging.config.fileConfig("log.conf")

    logging.info("application startup")
    package.module.function()
    package.module.Class().method()

    logging.critical("a fatal error occured")
