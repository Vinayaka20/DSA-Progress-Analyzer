package com.vinayaka.dsa.service;
import java.util.List;

import com.vinayaka.dsa.entity.Problem;
import com.vinayaka.dsa.repository.ProblemRepository;
import org.springframework.stereotype.Service;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem getProblemById(Long id) {
        return problemRepository.findById(id).orElse(null);
    }

    public Problem updateProblem(Long id, Problem problem) {
        Problem existingProblem = problemRepository.findById(id).orElse(null);

        if (existingProblem != null) {
            existingProblem.setTitle(problem.getTitle());
            existingProblem.setPlatform(problem.getPlatform());
            existingProblem.setDifficulty(problem.getDifficulty());
            existingProblem.setTopic(problem.getTopic());
            existingProblem.setProblemUrl(problem.getProblemUrl());

            return problemRepository.save(existingProblem);
        }

        return null;
    }

    public void deleteProblem(Long id) {
        problemRepository.deleteById(id);
    }

}