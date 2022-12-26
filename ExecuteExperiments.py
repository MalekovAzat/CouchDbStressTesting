from multiprocessing import Pool, Process, Pipe
# import seaborn as sns
import subprocess
import json
import matplotlib.pyplot as plt


def callNodeJsScript(conn, config):
    print(' '.join([f'--{k} {v}' for k, v in config.items()]))
    p = subprocess.Popen(
        f'node writeToCouchDb.js {" ".join([f"--{k} {v}" for k, v in config.items()])}',
        stdout=subprocess.PIPE,
        shell=True)
    res = p.communicate()[0].decode('ascii')
    res = [*filter(lambda x: x, res.split('\n'))]

    conn.send(res[0])


def createChart(data, c):
    timings, countRange = data

    fix, ax = plt.subplots()
    ax.boxplot(timings, labels=countRange)
    ax.set_title(c['set_title'])
    ax.set_xlabel(c['set_xlabel'])
    ax.set_ylabel(c['set_ylabel'])

    print(c['file_to_save'])
    plt.savefig('./charts/' + c['file_to_save'])
    plt.clf()


def readConfig(fileName='./config/experiments.json'):
    f = open(fileName)

    config = json.load(f)
    f.close()
    return config


def executeExperiment(exp):
    pToChange = exp['changeProp']

    parent_conn, child_conn = Pipe()

    [prop, mi, ma, step] = [pToChange['name'], pToChange
                            ['min'], pToChange['max'], pToChange['step']]

    constConfig = exp['constProp']

    timings = []

    rangeList = list(range(mi, ma, step))

    print('To start execution press enter')
    input()

    for v in rangeList:
        prList = []
        vToRange = v if prop == 'clients_count' else constConfig['clients_count']

        constConfig[prop] = v
        prList = [Process(target=callNodeJsScript, args=(
            child_conn, constConfig)) for i in range(0, vToRange)]

        for p in prList:
            p.start()
        for p in prList:
            p.join()

        results = [float(parent_conn.recv()) / 1000 for i in prList]
        timings.append(results)
        print('Iteration finished. Please press enter to start next iteration')
        input()

    return timings, rangeList


def main():
    config = readConfig()

    for experiment in config['experimets']:
        print(f'{experiment["name"]} execute: {experiment["execute"]}')

        if experiment['execute']:
            results = executeExperiment(experiment["config"])
            createChart(results, experiment['chart'])
            print('Done')


if __name__ == '__main__':
    main()
