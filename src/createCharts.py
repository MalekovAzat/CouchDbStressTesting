from tools import *


def main():
    globalConfig = tools.readJsonFile('./config/global.json')
    experimentConfig = tools.readJsonFile(globalConfig['experiment_file_path'])

    for expConfig in experimentConfig:
        tools.createChartOutputDirectories(globalConfig, expConfig)
        tools.createClientChart(globalConfig, expConfig)
        tools.createServerCharts(globalConfig, expConfig)


if __name__ == '__main__':
    main()
