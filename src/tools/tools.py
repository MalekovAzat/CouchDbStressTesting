import json
import os
import subprocess
import matplotlib.pyplot as plt


def readJsonFile(path):
    f = open(path)
    config = json.load(f)
    f.close()

    return config


def createOutputDirectories(globalConfig, expConfig):

    globalOutputDir = globalConfig['output_directory']
    createDirIfNotExists(globalOutputDir)

    dbOutputDir = expConfig["script"]['args']['local_db_directory_path']
    createDirIfNotExists(dbOutputDir)


def createChartOutputDirectories(globalConfig, expConfig):
    clientChartOutputDir = os.path.join(
        globalConfig['output_directory'], expConfig['charts']['client_metrics']['output_dir'])

    createDirIfNotExists(clientChartOutputDir)

    serverChartOutputDir = os.path.join(
        globalConfig['output_directory'], expConfig['charts']['server_metrics']['output_dir'])

    createDirIfNotExists(serverChartOutputDir)


def createDirIfNotExists(path):
    if not os.path.exists(path):
        os.makedirs(path)


def executeExperiment(globalConfig, expConfig):
    executableScriptString = constructExecutableString(
        expConfig['script'], globalConfig)

    subprocess.run(executableScriptString, shell=True)


def constructExecutableString(scriptConfig, globalConfig):
    executableFilePath = f'node {os.path.join(scriptConfig["path"], scriptConfig["name"])}'

    commandLineArgs = constructClaSring(scriptConfig['args'], globalConfig)

    return ' '.join([executableFilePath, commandLineArgs])


def constructClaSring(args, globalConfig):
    argsList = []

    for key, val in args.items():
        if isinstance(val, (bool,)):
            if val:
                argsList.append(f'--{key}')
        else:
            argsList.append(f'--{key}')

            if isinstance(val, (list,)):
                argsList.append(' '.join(map(str, val)))
            else:
                argsList.append(str(val))

    if 'output_directory' in globalConfig:
        argsList.append(f'--output_directory')
        argsList.append(globalConfig['output_directory'])

    return ' '.join(argsList)


def createClientChart(globalConfig, expConfig):
    sourceFilePath = os.path.join(
        globalConfig['output_directory'], expConfig['script']['args']['output_file'])

    chartData = parseClientChartData(
        sourceFilePath)

    outputFilePath = os.path.join(
        globalConfig['output_directory'], expConfig['charts']['client_metrics']['output_dir'], 'client_metrics.png'
    )

    boxPlotLabels = expConfig['script']['args']['local_client_count']

    drowAndSaveBoxPlot(chartData, boxPlotLabels,
                       globalConfig, expConfig, outputFilePath)


def parseClientChartData(sourceFilePath):
    f = open(sourceFilePath, 'r')
    lines = f.readlines()
    res = []
    for line in lines:
        expRes = [float(v) for v in line.split(', ')]
        res.append(expRes)

    return res


def drowAndSaveBoxPlot(data, labels, globalConfig, expConfig, savePath):
    fix, ax = plt.subplots()

    title = expConfig['charts']['client_metrics']['title']
    xLabel = globalConfig['charts']['client_metrics']['x_label']
    yLabel = globalConfig['charts']['client_metrics']['y_label']

    ax.boxplot(data, labels=labels)
    ax.set_title(title)
    ax.set_ylabel(yLabel)
    ax.set_xlabel(xLabel)

    plt.savefig(savePath)
    plt.clf()


def createServerCharts(globalConfig, expConfig):
    sourceFolder = os.path.join(
        globalConfig['output_directory'], expConfig['charts']['server_metrics']['data_source_path'])

    outputFolderPath = os.path.join(
        globalConfig['output_directory'], expConfig['charts']['server_metrics']['output_dir']
    )

    clientsRange = expConfig['script']['args']['local_client_count']

    timelines, cpuMetrics, ramMetrics = parseFilesFromSourceFolder(
        sourceFolder)

    for expIndex in range(len(timelines)):
        timeline = timelines[expIndex]
        cpu = cpuMetrics[expIndex]
        ram = ramMetrics[expIndex]

        chartFilePath = os.path.join(
            outputFolderPath,
            f'server_metrics_clients_{clientsRange[expIndex]}.png')

        createServerMetricsChart(
            clientsRange[expIndex], timeline, cpu, ram, globalConfig, expConfig, chartFilePath)


def parseFilesFromSourceFolder(sourceFolder):
    files = [os.path.join(sourceFolder, f) for f in os.listdir(sourceFolder) if os.path.isfile(
        os.path.join(sourceFolder, f))]

    files.sort()

    timelines = []
    cpuMetrics = []
    ramMetrics = []

    for file in files:
        time, cpu, ram = getMetricsFromFile(file)

        timelines.append(time)
        cpuMetrics.append(cpu)
        ramMetrics.append(ram)

    return timelines, cpuMetrics, ramMetrics


def getMetricsFromFile(file):
    f = open(file)
    lines = f.readlines()

    time = list(range(1, len(lines)+1))

    cpu = []
    ram = []

    for line in lines:
        l = line.strip("\n").split()

        cpu.append(float(l[7]))
        ram.append(int(l[12]) / 1024)

    return time, cpu, ram


def createServerMetricsChart(clientsCount, timeline, cpu, ram, globalConfig, expConfig, savePath):
    fig, axs = plt.subplots(2)

    fig.set_figheight(9)

    globalChartMeta = globalConfig['charts']['server_metrics']
    expChartMeta = expConfig['charts']['server_metrics']

    title = f"{expChartMeta['title']} \n Clients: {clientsCount}"
    fig.suptitle(title, fontweight="bold")

    cpu_title = expChartMeta['cpu_title']
    cpu_x_axis = globalChartMeta['cpu']['x_label']
    cpu_y_axis = globalChartMeta['cpu']['y_label']

    p1, = axs[0].plot(timeline, cpu, 'b-', label='cpu')
    axs[0].set_title(cpu_title)
    axs[0].set_xlabel(cpu_x_axis)
    axs[0].set_ylabel(cpu_y_axis)

    ram_title = expChartMeta['ram_title']
    ram_x_axis = globalChartMeta['ram']['x_label']
    ram_y_axis = globalChartMeta['ram']['y_label']

    p1, = axs[1].plot(timeline, cpu, 'r-', label='ram')
    axs[1].set_title(ram_title)
    axs[1].set_xlabel(ram_x_axis)
    axs[1].set_ylabel(ram_y_axis)

    plt.savefig(savePath)
    plt.clf()
